"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    setIsStandalone(isStandaloneMode);

    // Check if user has already dismissed the prompt
    const hasPromptBeenDismissed = localStorage.getItem("pwa-prompt-dismissed");

    if (!isStandaloneMode && !hasPromptBeenDismissed) {
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // Show prompt after a delay to not interrupt initial load
        setTimeout(() => setShowPrompt(true), 3000);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // Handle app installed event
      window.addEventListener("appinstalled", () => {
        setShowPrompt(false);
        setDeferredPrompt(null);
        console.log("PWA was installed");
      });

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  // Don't show if already installed or dismissed
  if (isStandalone || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="pwa-install-prompt">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-blue-900">
                  Install Squad Games
                </h3>
                <p className="text-sm text-blue-700">
                  Add to your home screen for quick access and offline use
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Install
                </Button>

                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-300"
                >
                  Later
                </Button>
              </div>
            </div>

            <Button
              onClick={handleDismiss}
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-blue-500 hover:text-blue-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
