export type AuthActor = "User" | "Client App" | "Auth Server" | "Resource Server";

export type AuthFlowStep = {
  actor: AuthActor;
  action: string;
  payload: Record<string, string> | null;
  narration: string;
  done: boolean;
};

// A real OAuth 2.0 authorization-code flow — each step's payload is a value
// genuinely produced by an earlier step and consumed by a later one, not a
// hardcoded placeholder repeated at each step.
export function generateAuthFlowSteps(): AuthFlowStep[] {
  const steps: AuthFlowStep[] = [];

  steps.push({
    actor: "Client App",
    action: "Redirect to Auth Server",
    payload: { client_id: "app_42", redirect_uri: "/callback", scope: "read:profile" },
    narration: "The client app redirects the user to the Auth Server's login page, with its client_id and where to send the user back.",
    done: false,
  });

  steps.push({
    actor: "User",
    action: "Log in & approve",
    payload: { consent: "approved" },
    narration: "The user logs in on the Auth Server (never the client app) and approves the requested scope.",
    done: false,
  });

  const authCode = "code_9f8e7d";
  steps.push({
    actor: "Auth Server",
    action: "Redirect back with an authorization code",
    payload: { code: authCode },
    narration: `The Auth Server redirects back to the client's redirect_uri with a short-lived authorization code (${authCode}) — not a token yet.`,
    done: false,
  });

  steps.push({
    actor: "Client App",
    action: "Exchange the code for a token",
    payload: { code: authCode, client_secret: "••••••" },
    narration: `The client's backend exchanges that exact code (${authCode}) plus its client_secret for a token — this call happens server-to-server, the code is never usable twice.`,
    done: false,
  });

  const accessToken = "tok_ab12cd34";
  steps.push({
    actor: "Auth Server",
    action: "Return an access token",
    payload: { access_token: accessToken, expires_in: "3600" },
    narration: `The Auth Server validates the code and returns a real access token (${accessToken}).`,
    done: false,
  });

  steps.push({
    actor: "Client App",
    action: "Call the API with the token",
    payload: { Authorization: `Bearer ${accessToken}` },
    narration: `The client calls the Resource Server's API, attaching that exact token (${accessToken}) as a Bearer credential.`,
    done: false,
  });

  steps.push({
    actor: "Resource Server",
    action: "Validate the token & respond",
    payload: { status: "200 OK", body: '{"profile": "..."}' },
    narration: `The Resource Server checks the token's signature and expiry before returning data — it never sees the user's password, only the token.`,
    done: true,
  });

  return steps;
}
