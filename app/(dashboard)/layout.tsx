

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <div className="flex min-h-screen bg-[#050505]">

                <main className="flex-1 px-4 md:px-8 py-6">
                    {children}
                </main>
            </div>
        </>

    );
};

export default DashboardLayout;


// import React from "react";
// import FlatingIcons from "@/components/Dashboard/FlatingIcons";

// const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
//     return (
//         <div className="relative flex min-h-screen bg-[#050505] text-white overflow-hidden">
//             {/* Floating Icons always visible in the background */}
//             <FlatingIcons />

//             {/* Main Content */}
//             <main className="flex-1 px-4 md:px-8 py-6 relative z-10">
//                 {children}
//             </main>
//         </div>
//     );
// };

// export default DashboardLayout;