import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/users";

export function useCurrentUser() {
    return useQuery({
        queryKey: ["currentUser"],
        queryFn: ({signal}) => getCurrentUser(signal),
        staleTime: 5 * 60 * 1000
    })
}