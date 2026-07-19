type AuthPageHeaderProps = {
  title: string;
  description: string;
};

export function AuthPageHeader({ title, description }: AuthPageHeaderProps) {
  return (
    <header>
      <h1 className="text-2xl font-black leading-10 text-foreground">{title}</h1>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
    </header>
  );
}
