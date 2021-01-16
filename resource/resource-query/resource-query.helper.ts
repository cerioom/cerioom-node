export function addFiltersToField(filter: any, additional: any) {
    if (filter) {
        if (typeof filter === 'string') {
            return {
                eq: filter,
                ...additional,
            }
        }

        if (Array.isArray(filter)) {
            return {
                $in: filter,
                ...additional,
            }
        }

        return {
            ...filter,
            ...additional,
        }
    }

    return additional
}
