import React from "react";
import { NavLink } from "react-router-dom";
function Sidebar() {
  const menus = [
    {
      name:"Dashboard",
      path:"/dashboard",
      icon:"📊",
    },
    {
      name:"Vehicles",
      path:"/vehicles",
      icon:"🚗",
    },
    {
      name:"Drivers",
    },
    {
      name:"Drivers",
      path: "/drivers",
      icon: "👨‍✈️",
    },
    {
      name: "Trips",
      path: "/trips",
      icon: "🛣️",
    },
    {
      name: "Maintenance",
      path: "/maintenance",
      icon: "🔧",
    },
    {
      name: "Fuel & Expenses",
      path: "/fuel-expenses",
      icon: "⛽",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: "📈",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: "⚙️",
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="text-2xl font-bold p-6 border-b border-gray-700">
        TransitOps
      </div>
      <nav className="mt-4">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 hover:bg-blue-600 transition ${
                isActive ? "bg-blue-600" : ""
              }`
            }
          >
            <span>{menu.icon}</span>
            <span>{menu.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
export default Sidebar;