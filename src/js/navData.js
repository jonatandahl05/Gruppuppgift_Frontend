// navData.js
export const menuData = [
    {
        key: "people",
        label: "Characters",
        subItems: [
            { label: "All", action: "list", resource: "people" },
            { label: "Favourites", action: "favorites", resource: "people" },
            { label: "Dark Side", action: "filter", resource: "people", filter: "dark" },
            { label: "Light Side", action: "filter", resource: "people", filter: "light" }
        ]
    },
    {
        key: "planets",
        label: "Planets",
        subItems: [
            { label: "All", action: "list", resource: "planets" }
        ]
    },
    {
        key: "starships",
        label: "Starships",
        subItems: [
            { label: "All", action: "list", resource: "starships" },
            { label: "Imperial", action: "filter", resource: "starships", filter: "imperial" },
            { label: "Rebel", action: "filter", resource: "starships", filter: "rebel" }
        ]
    },
    {
        key: "films",
        label: "Movies",
        subItems: [
            { label: "All", action: "list", resource: "films" }
        ]
    }
];