import type { CityResources } from '../types/game';
import { resourceConfig } from '../config/resourceConfig';

interface ResourceBarProps {
    resources: CityResources;
}

function ResourceBar({ resources }: ResourceBarProps) {

    const formatNumber = (value: number) =>
        Math.floor(value).toLocaleString('es-ES');

    return (
        <div className="resource-bar">
    
            {resources.resources.map((resource) => {
    
                const config =
                    resourceConfig[
                        resource.name as keyof typeof resourceConfig
                    ];
    
                return (
                    <div
                        className="resource"
                        key={resource.resource_id}
                        title={resource.name}
                    >
    
                        <strong
                            className="resource-value"
                            style={{
                                color: config?.color
                            }}
                        >
                            {config?.icon ?? '❓'}{' '}
                            {formatNumber(Number(resource.amount))}
                        </strong>
    
                    </div>
                );
            })}
    
        </div>
    );
}

export default ResourceBar;