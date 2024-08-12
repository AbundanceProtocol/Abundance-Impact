import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { neynar } from "frog/hubs";
const HubURL = process.env.NEYNAR_HUB

export const app = new Frog({
  hub: neynar({ apiKey: HubURL }),
});

app.frame("/", (c) => {
  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          height: "100%",
          textAlign: "center",
          width: "100%",
          display: "flex",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          Create a multi step cast action
        </div>
      </div>
    ),
    intents: [
      <Button.AddCastAction action="/get-cast-hash">Add</Button.AddCastAction>,
    ],
  });
});

app.castAction(
  "/get-cast-hash",
  (c) => {
    return c.frame({ path: "/cast-hash" });
  },
  { name: "Get cast hash", icon: "hash" }
);

app.frame("/cast-hash", (c) => {
  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 48,
            marginTop: 30,
            padding: "0 120px",
          }}
        >
          Cast hash is:
        </div>
        <div
          style={{
            color: "white",
            fontSize: 48,
            marginTop: 30,
            padding: "0 120px",
          }}
        >
          {c.frameData?.castId.hash}
        </div>
      </div>
    ),
  });
});

app.use("/*", serveStatic({ root: "./public" }));
devtools(app, { serveStatic });

if (typeof Bun !== "undefined") {
  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  });
  console.log("Server is running on port 3000");
}
