import { EmailPicker } from "@/components/EmailPicker";

type SocialLink = {
  label: string;
  href: string;
  external?: boolean;
};

const links: SocialLink[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/matthew-slater/",
    external: true,
  },
  {
    label: "X",
    href: "https://x.com/slaterm100",
    external: true,
  },
  {
    label: "Telegram",
    href: "https://t.me/slaterm100",
    external: true,
  },
];

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-8 ${className}`}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          {...(link.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="group flex items-center gap-2 text-sm text-gray-400 transition-colors duration-200 hover:text-white"
        >
          {link.label}
          <span className="inline-block translate-x-0 transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </a>
      ))}
      <EmailPicker className="group flex items-center gap-2 text-sm text-gray-400 transition-colors duration-200 hover:text-white" />
    </div>
  );
}
