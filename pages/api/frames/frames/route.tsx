/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";
 
const handleRequest = frames(async (ctx) => {
  return {
    image: (
      <span>
        I clicked
      </span>
    ),
    buttons: [
      <Button action="post" target={{ query: { value: "Yes" } }}>
        Say Yes
      </Button>,
      <Button action="post" target={{ query: { value: "No" } }}>
        Say No
      </Button>,
    ],
  };
});
 
export const GET = handleRequest;
export const POST = handleRequest;