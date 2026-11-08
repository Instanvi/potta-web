import { usePathname } from 'next/navigation';
import { getActiveModule } from '@/lib/navigation';
import ModuleSidebar from './components/ModuleSidebar';
import SidebarsHome from './components/home';
import SidebarsSettings from './components/settings';

const Sidebars = () => {
  const pathname = usePathname();
  const module = getActiveModule(pathname);

  if (module) return <ModuleSidebar module={module} />;
  if (pathname.startsWith('/settings')) return <SidebarsSettings />;
  return <SidebarsHome />;
};

export default Sidebars;
