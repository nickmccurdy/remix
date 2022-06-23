import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { authenticator, sessionStorage, supabaseStrategy } from "~/auth.server";
import { signInWithGithub } from "~/supabase.client";

type LoaderData = {
  error: { message: string } | null;
};

export const action: ActionFunction = async ({ request }) => {
  await authenticator.authenticate("sb", request, {
    successRedirect: "/private",
    failureRedirect: "/login",
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  await supabaseStrategy.checkSession(request, {
    successRedirect: "/private",
  });

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const error = session.get(
    authenticator.sessionErrorKey
  ) as LoaderData["error"];

  return json<LoaderData>({ error });
};

export default function Screen() {
  const { error } = useLoaderData() as LoaderData;

  return (
    <>
      <Form method="post">
        {error && <div>{error.message}</div>}
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" />
        </div>

        <button>Log In</button>
      </Form>
      <p>
        <button onClick={() => signInWithGithub()}>Sign in with Github</button>
      </p>
    </>
  );
}
