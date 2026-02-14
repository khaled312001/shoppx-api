import WebSocket from "ws";
import http from "http";
import { Request } from "express";

interface EditorUser {
  name: string;
  email: string;
  image: string;
  isEditor: boolean;
}

interface EditorConnection {
  ws: WebSocket;
  user: EditorUser | null;
}

interface EditorPool {
  [tenant: string]: {
    server: WebSocket.Server;
    connections: { [slug: string]: EditorConnection[] };
  };
}

const editorPool: EditorPool = {};

export const setupEditorWebSocketServer = (server: http.Server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws:  WebSocket, req: Request) => {
    const urlParams = new URLSearchParams(req.url?.split("?")[1]);
    const slug = urlParams.get("slug");
    const tenant = urlParams.get("tenant");

    if (!slug || !tenant) {
      ws.close();
      return;
    }

    if (!editorPool[tenant]) {
      editorPool[tenant] = {
        server: wss,
        connections: {},
      };
    }

    if (!editorPool[tenant].connections[slug]) {
      editorPool[tenant].connections[slug] = [];
    }

    ws.on("message", (message: string) => {
      const data = JSON.parse(message);
      switch (data.type) {
        case "register":
          handleJoin(ws, tenant, slug, data.user, data.content);
          break;
        case "assign-editor":
          handleAssignEditor(ws, tenant, slug, data.user, data.content);
          break;
        case "content-update":
          handleContentUpdate(ws, tenant, slug, data.content);
          break;
        case "request-editing-access":
          handleAccessRequest(ws, tenant, slug, data.user);
          break;
        case "access-granted":
          handleAssignEditor(ws, tenant, slug, data.user, data.content);
      }
    });

    ws.on("close", () => {
      console.log("someone disconnected");
      handleDisconnect(ws, tenant, slug);
    });
  });
};

const handleJoin = (
  ws: WebSocket,
  tenant: string,
  slug: string,
  user: EditorUser,
  content: string
) => {
  const tenantPool = editorPool[tenant];

  const existingConnection = tenantPool.connections[slug].find(
    (conn) => conn.user?.email === user.email
  );

  if (existingConnection) {
    existingConnection.ws = ws;
    existingConnection.user = {
      ...user,
      isEditor: existingConnection.user?.isEditor || false,
    };
  } else {
    const isFirstUser = tenantPool.connections[slug].length === 0;
    user.isEditor = isFirstUser;
    tenantPool.connections[slug].push({ ws, user });
  }

  // Notify the new user of successful registration
  ws.send(
    JSON.stringify({
      type: "registered",
      user: { ...user, isEditor: user.isEditor },
      content,
    })
  );

  broadcastEditorUpdate(tenant, slug, content);
};

const handleAssignEditor = (
  ws: WebSocket,
  tenant: string,
  slug: string,
  newEditor: EditorUser,
  content: string
) => {
  const tenantPool = editorPool[tenant];

  tenantPool.connections[slug].forEach((conn) => {
    if (conn.user) {
      conn.user.isEditor = conn.user.email === newEditor.email;
    }
  });

  broadcastEditorUpdate(tenant, slug, content);
};

const handleDisconnect = (ws: WebSocket, tenant: string, slug: string) => {
  const tenantPool = editorPool[tenant];
  const disconnectedUser = tenantPool.connections[slug].find(
    (conn) => conn.ws === ws
  );

  tenantPool.connections[slug] = tenantPool.connections[slug].filter(
    (conn) => conn.ws !== ws
  );

  if (tenantPool.connections[slug].length > 0) {
    if (disconnectedUser?.user?.isEditor) {
      tenantPool.connections[slug][0].user!.isEditor = true;
    }
    broadcastEditorUpdate(tenant, slug);
  } else {
    tenantPool.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "editor-disconnected",
            slug,
          })
        );
      }
    });
  }
};

const handleContentUpdate = (
  ws: WebSocket,
  tenant: string,
  slug: string,
  content: string
) => {
  console.log("Received content update", content);
  broadcastEditorUpdate(tenant, slug, content);
};

const broadcastEditorUpdate = (
  tenant: string,
  slug: string,
  content?: string
) => {
  const tenantPool = editorPool[tenant];
  const currentEditor = tenantPool.connections[slug].find(
    (conn) => conn.user?.isEditor
  )?.user;

  tenantPool.connections[slug].forEach((conn) => {
    conn.ws.send(
      JSON.stringify({
        type: "editor-update",
        editor: currentEditor,
        users: tenantPool.connections[slug].map((conn) => conn.user),
        content: content,
      })
    );
  });
};

const handleAccessRequest = (
  ws: WebSocket,
  tenant: string,
  slug: string,
  user: EditorUser
) => {
  const tenantPool = editorPool[tenant];
  const currentEditor = tenantPool.connections[slug].find(
    (conn) => conn.user?.isEditor
  );

  if (currentEditor?.user?.email !== user.email) {
    currentEditor?.ws.send(
      JSON.stringify({
        type: "request-editing-access",
        user: user,
      })
    );
    return;
  }
};
