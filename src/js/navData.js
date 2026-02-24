// navData.js
export const menuData = [
    { key: "people", label: "Characters", action: "list", resource: "people" },
    { key: "light", label: "Light Side", action: "filter", resource: "people", filter: "light" },
    { key: "dark", label: "Dark Side", action: "filter", resource: "people", filter: "dark" },

    { key: "planets", label: "Planets", action: "list", resource: "planets" },
    { key: "starships", label: "Starships", action: "list", resource: "starships" },

    { key: "films", label: "Movies", action: "list", resource: "films" },
    { key: "skywalker", label: "Skywalker Saga", action: "filter", resource: "films", filter: "skywalker" },
    { key: "vehicles", label: "Vehicles", action: "list", resource: "vehicles" },
    { key: "species", label: "Species", action: "list", resource: "species" },

    { key: "favorites", label: "Favorites", action: "favorites", resource: "" }
];
