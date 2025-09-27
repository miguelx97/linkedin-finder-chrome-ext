import { useEffect, useState } from "react";

export default function useDebounce<T>(value: T, delay: number) {
    const [debounceValue, setDebounceValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceValue(value as T);
        }, delay);

        return () => {
            clearTimeout(handler);
        }
    }, [value, delay])

    return debounceValue;
}