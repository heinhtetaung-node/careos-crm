import { IRoutes } from 'presentation/routes/route.interface';
import { getString } from 'presentation/theme/localization';

const getSidebarRoutes = ({
  role,
  sidebar,
  flags,
}: {
  role: string;
  sidebar: IRoutes[];
  flags: Record<string, boolean>;
}) => {
  const routes: IRoutes[] = [];

  sidebar.forEach((data: IRoutes) => {
    if (
      (data?.permission as string[]).includes(role) &&
      flags[data?.id as string] !== false
    ) {
      if (data.standAlone) {
        const firstChild = (data?.children as IRoutes[])[0];
        routes.push({ ...data, path: firstChild.path });
      } else {
        const children: IRoutes[] = [];
        (data?.children as IRoutes[]).forEach((child: IRoutes) => {
          if (
            child?.permission?.includes(role) &&
            flags[child?.id as string] !== false &&
            child?.id &&
            child?.sideBar === true &&
            child.name
          ) {
            children.push({ ...child, name: getString(child.name) });
          }
        });
        routes.push({ ...data, children });
      }
    }
  });

  return routes;
};

export default getSidebarRoutes;
