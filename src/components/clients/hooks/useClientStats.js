/*
==========================================================
CLIENT STATS
==========================================================
*/

import { useMemo } from "react";

import {

    buildClientStats

} from "../services/clientServices";

export default function useClientStats(clients = []) {

    const stats = useMemo(() => {

        return buildClientStats(clients);

    }, [

        clients

    ]);

    return stats;

}