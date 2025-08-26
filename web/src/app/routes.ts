
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Use Vite's import.meta.glob to auto-import all page components
const pages = import.meta.glob('./**/page.jsx');
const NotFound = lazy(() => import('./__create/not-found.tsx'));

// Helper to convert file path to route path
function filePathToRoutePath(filePath: string): string {
	// Remove leading './' and trailing '/page.jsx'
	let route = filePath.replace(/^\.\//, '').replace(/\/page\.jsx$/, '');
	// Index route
	if (route === '') return '/';
	// Convert [param] to :param, [...param] to *
	route = route.replace(/\[(\.\.\.)?(\w+)\]/g, (_, dots, param) => (dots ? '*' : `:${param}`));
	return '/' + route;
}

const routes: RouteObject[] = [
	...Object.keys(pages).map((filePath) => {
		const path = filePathToRoutePath(filePath);
		const Element = lazy(pages[filePath] as any);
		return path === '/'
			? { index: true, element: <Element /> }
			: { path: path === '/index' ? '/' : path, element: <Element /> };
	}),
	{ path: '*', element: <NotFound /> },
];

export default routes;
