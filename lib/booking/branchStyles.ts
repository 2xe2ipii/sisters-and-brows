export const getBranchStyle = (rawName: string) => {
    const n = (rawName || "").toLowerCase();

    if (n.includes('parañaque') || n.includes('paranaque')) {
        return { name: "Parañaque", color: "text-orange-600", border: "border-orange-300", bg: "bg-orange-600", light: "bg-orange-50" };
    }
    if (n.includes('lipa')) {
        return { name: "Lipa City", color: "text-blue-600", border: "border-blue-300", bg: "bg-blue-600", light: "bg-blue-50" };
    }
    if (n.includes('san pablo')) {
        return { name: "San Pablo", color: "text-yellow-600", border: "border-yellow-300", bg: "bg-yellow-500", light: "bg-yellow-50" };
    }
    if (n.includes('novaliches')) {
        return { name: "Novaliches", color: "text-violet-600", border: "border-violet-300", bg: "bg-violet-600", light: "bg-violet-50" };
    }
    if (n.includes('dasmariñas') || n.includes('dasmarinas')) {
        return { name: "Dasmariñas", color: "text-cyan-600", border: "border-cyan-300", bg: "bg-cyan-500", light: "bg-cyan-50" };
    }
    if (n.includes('taguig')) {
        return { name: "Taguig", color: "text-emerald-600", border: "border-emerald-300", bg: "bg-emerald-600", light: "bg-emerald-50" };
    }
    if (n.includes('marikina')) {
        return { name: "Marikina", color: "text-[#ffbab2]", border: "border-[#ffbab2]/50", bg: "bg-[#ffbab2]", light: "bg-[#ffbab2]/10" };
    }
    if (n.includes('calamba')) {
        return { name: "Calamba", color: "text-[#c6c3c3]", border: "border-[#1a1919]/50", bg: "bg-[#a8a3a3]", light: "bg-[#c6c3c3]/10" };
    }
    if (n.includes('monumento') || n.includes('caloocan')) {
        return { name: "Monumento", color: "text-[#EAC392]", border: "border-[#EAC392]/50", bg: "bg-[#EAC392]", light: "bg-[#EAC392]/10" };
    }
    if (n.includes('las piñas') || n.includes('las pinas')) {
        return { name: "Las Piñas", color: "text-[#3DD4DA]", border: "border-[#3DD4DA]/50", bg: "bg-[#3DD4DA]", light: "bg-[#3DD4DA]/10" };
    }
    if (n.includes('marilao') || n.includes('bulacan')) {
        return { name: "Marilao", color: "text-[#E070D8]", border: "border-[#E070D8]/50", bg: "bg-[#E070D8]", light: "bg-[#E070D8]/10" };
    }

    return { name: rawName || "Main Branch", color: "text-zinc-800", border: "border-zinc-300", bg: "bg-zinc-800", light: "bg-zinc-50" };
};
