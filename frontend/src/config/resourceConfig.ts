export const resourceConfig = {
    Minerales: {
        icon: '🧱',
        color: '#9ca3af'
    },

    Madera: {
        icon: '🌲',
        color: '#a16207'
    },

    Comida: {
        icon: '🌾',
        color: '#eab308'
    }
} as const;

export const getResourceIcon = (resourceName: string) => {
    return resourceConfig[
        resourceName as keyof typeof resourceConfig
    ]?.icon ?? '📦';
};


export const getResourceColor = (resourceName: string) => {
    return resourceConfig[
        resourceName as keyof typeof resourceConfig
    ]?.color ?? '#f0e6d2';
};