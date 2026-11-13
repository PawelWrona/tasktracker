import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/users";

export function useUsers(enabled = true) {
    return useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
        staleTime: 5 * 60 * 1000,
        enabled
    })
}