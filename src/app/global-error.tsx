'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body className="bg-[#0F111A] text-white flex flex-col items-center justify-center min-h-screen p-4">
                <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi! 😢</h2>
                <p className="mb-4 text-white/60 font-mono text-sm bg-black/50 p-4 rounded max-w-2xl break-all">
                    {error.message || "Unknown error"}
                </p>
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-[#FFD875] text-black font-bold rounded hover:bg-[#f0a500] transition-colors"
                >
                    Thử lại
                </button>
            </body>
        </html>
    )
}
