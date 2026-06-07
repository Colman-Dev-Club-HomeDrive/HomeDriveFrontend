import { NAV_ITEMS } from '@/consts/consts';
import { SideBarNavLinksItem } from './SideBarNavLinksItem';

export function SideBarNavLinks() {
  return (
    <nav className="flex w-full flex-1 flex-col gap-1 px-2 py-2">
      {NAV_ITEMS.map(({ to, icon, label }) => (
        <SideBarNavLinksItem key={to} to={to} icon={icon} label={label} />
      ))}
    </nav>
  );
}
