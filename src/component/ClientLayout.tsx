"use client";

import { usePathname } from "next/navigation";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import BottomNav from "@/component/BottomNav";
import ScrollToTop from "@/component/ScrollToTop";
import { PreferencesProvider } from "@/lib/usePreferences";
import { ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "animate.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@ant-design/v5-patch-for-react-19";

// Prevent FontAwesome from adding its CSS automatically
config.autoAddCss = false;

const SettingsPanel = dynamic(() => import("@/component/SettingsPanel"), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <PreferencesProvider>
            <ScrollToTop />
            {pathname === "/" ? (
                <>
                    {children}
                    <BottomNav />
                </>
            ) : (
                <div className="bg-[#0F111A] min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                    <div className="pb-[80px] min-[1024px]:pb-0 bg-[#0a0c14]" />
                    <ToastContainer position="bottom-right" theme="dark" />
                    <SettingsPanel />
                    <BottomNav />
                </div>
            )}
        </PreferencesProvider>
    );
}
