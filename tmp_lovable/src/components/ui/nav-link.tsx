import { Link as RouterLink } from "@tanstack/react-router";

type NavLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  prefetch?: boolean;
};

/** Drop-in replacement for next/link backed by TanStack Router. */
export default function Link({ href, prefetch: _prefetch, ...props }: NavLinkProps) {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) {
    return <a href={href} {...props} />;
  }
  return <RouterLink to={href as never} {...props} />;
}
