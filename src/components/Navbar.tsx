"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-serif text-xl text-white tracking-tight">
            Private<span className="text-orange-500">Will</span>
          </span>
          <span className="text-[10px] font-mono text-gray-500 border border-gray-700 px-2 py-0.5 uppercase tracking-widest">
            Sepolia
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={openConnectModal}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#375BD2] to-[#2d4bb8] text-white font-medium hover:shadow-[0_0_30px_rgba(55,91,210,0.5)] transition-shadow"
                        >
                          Connect Wallet
                        </motion.button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-medium"
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={openChainModal}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0f172a]/80 border border-[#375BD2]/20 hover:border-[#375BD2]/40 transition-colors"
                        >
                          {chain.hasIcon && (
                            <div className="w-5 h-5">
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  className="w-5 h-5"
                                />
                              )}
                            </div>
                          )}
                        </button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={openAccountModal}
                          className="px-4 py-2.5 rounded-xl bg-[#0f172a]/80 border border-[#375BD2]/30 hover:border-[#375BD2]/60 transition-all text-white font-medium hover:shadow-[0_0_20px_rgba(55,91,210,0.3)]"
                        >
                          {account.displayName}
                        </motion.button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </nav>
  );
}
