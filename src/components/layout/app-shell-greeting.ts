type AppShellGreetingUser = {
  displayName: string;
  email: string;
};

export function getAppShellGreeting(user: AppShellGreetingUser) {
  const displayName = user.displayName.trim();

  if (displayName && displayName.toLowerCase() !== "user") {
    const firstName = displayName.split(/\s+/)[0];
    return firstName ? `Hi, ${firstName}` : "Hi";
  }

  const emailName = user.email.split("@")[0]?.trim();
  return emailName ? `Hi, ${emailName}` : "Hi";
}
