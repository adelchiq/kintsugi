import { SignInClient } from "./sign-in-client";

export default function SignInPage() {
  const githubAuthConfigured = Boolean(process.env.AUTH_GITHUB_ID);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <SignInClient githubAuthConfigured={githubAuthConfigured} />
    </div>
  );
}
