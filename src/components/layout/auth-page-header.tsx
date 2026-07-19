type AuthPageHeaderProps = {
  title: string;
  description: string;
};

export function AuthPageHeader({ title, description }: AuthPageHeaderProps) {
  return (
    <header>
      <h1 className="text-3xl font-semibold leading-tight text-[#12352A]">{title}</h1>
      <p className="mt-3 text-sm leading-7 text-[#51685D]">{description}</p>
    </header>
  );
}
