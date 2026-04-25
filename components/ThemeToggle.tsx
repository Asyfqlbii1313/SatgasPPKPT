'use client'

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const ThemeToggle = () => {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    // Mencegah hydration mismatch
    useEffect(() => setMounted(true), [])

    if (!mounted) return <div className="w-10 h-10" />

    const isDark = theme === "dark"

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative w-16 h-8 flex items-center bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition-colors duration-500 focus:outline-none"
        >
            <div className="absolute left-1 flex items-center justify-center w-6 h-6">
                <span className="material-symbols-outlined text-[18px] text-orange-500">light_mode</span>
            </div>

            <div className="absolute right-1 flex items-center justify-center w-6 h-6">
                <span className="material-symbols-outlined text-[18px] text-blue-400">dark_mode</span>
            </div>

            <motion.div
                animate={{ x: isDark ? 32 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="z-10 w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center"
            >
                <motion.span
                    key={isDark ? "dark" : "light"}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="material-symbols-outlined text-[14px] text-blue-600 dark:text-blue-400"
                >
                    {isDark ? 'circle' : 'circle'}
                </motion.span>
            </motion.div>
        </button>
    )
}

export default ThemeToggle