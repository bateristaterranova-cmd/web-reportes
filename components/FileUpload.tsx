"use client";

import { useState, useCallback } from "react";
import { Upload, FileUp, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onUpload: (file: File) => void;
    isProcessing: boolean;
}

export function FileUpload({ onUpload, isProcessing }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                setFileName(file.name);
                onUpload(file);
            }
        },
        [onUpload]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFileName(file.name);
            onUpload(file);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto mb-8">
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
                    dragActive
                        ? "border-blue-500 bg-blue-50/50 scale-[1.02]"
                        : "border-gray-300 hover:border-gray-400 bg-white/50 hover:bg-white/80",
                    isProcessing ? "opacity-50 cursor-wait" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleChange}
                    disabled={isProcessing}
                />

                <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none z-0">
                    <div className={cn("p-4 rounded-full transition-colors", dragActive ? "bg-blue-100" : "bg-gray-100")}>
                        {fileName ? <CheckCircle className="w-10 h-10 text-green-500" /> : <Upload className="w-10 h-10 text-gray-400" />}
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-700">
                            {fileName ? fileName : "Arrastra y suelta tu archivo aquí"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {fileName ? "Archivo seleccionado" : "o haz clic para explorar (.xlsx, .csv)"}
                        </p>
                    </div>
                </div>

                {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                            <p className="text-sm font-medium text-blue-600">Procesando...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
