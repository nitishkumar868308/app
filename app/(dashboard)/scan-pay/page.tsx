"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ScanPayPage = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace("/transfer");
    }, [router]);

    return null;
};

export default ScanPayPage;
