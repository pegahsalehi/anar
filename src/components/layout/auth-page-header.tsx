type AuthPageHeaderProps = {
  title: string;
  description: string;
};

export function AuthPageHeader({ title, description }: AuthPageHeaderProps) {
  return (
    <header>
      <h1 className="text-2xl font-semibold leading-tight text-[#12352A] sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-[#51685D] sm:mt-3 sm:leading-7">{description}</p>
    </header>
  );
}
