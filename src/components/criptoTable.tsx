"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

// Register chart components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

interface CryptoItem {
  id: number;
  name: string;
  symbol: string;
  logo?: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
      percent_change_7d: number;
      market_cap: number;
    };
  };
}

function CriptoTable() {
  const [cryptos, setCryptos] = useState<CryptoItem[]>([]);
  const [page, setPage] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState<CryptoItem | null>(null);
  const [filter, setFilter] = useState<"24h" | "7d">("24h");

  const rowsPerPage = 5;
  const totalPages = Math.ceil(cryptos.length / rowsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return cryptos.slice(start, start + rowsPerPage);
  }, [page, cryptos]);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const generateChartData = (type: "24h" | "7d", basePrice: number) => {
    const points = type === "24h" ? 24 : 7;
    const labels = Array.from({ length: points }, (_, i) =>
      type === "24h" ? `${i + 1}h` : `Day ${i + 1}`
    );
    const fluctuation = type === "24h" ? 0.02 : 0.05;
    const data = Array.from(
      { length: points },
      () => basePrice + (Math.random() - 0.5) * basePrice * fluctuation
    );

    return {
      labels,
      datasets: [
        {
          label: `${selectedCoin?.symbol} ${type} Price Trend`,
          data,
          fill: false,
          borderColor: "#3b82f6",
          backgroundColor: "#3b82f6",
        },
      ],
    };
  };

  // const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const proxyUrl = "https://thingproxy.freeboard.io/fetch/";
  const apiKey = "b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c";
  const apiUrl =
    "https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";

  const getCryptoListing = async () => {
    try {
      const response = await axios.get(proxyUrl + apiUrl, {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
        },
      });

      const rawData: CryptoItem[] = response.data.data;

      const ids = rawData
        .map((coin) => coin.id)
        .slice(0, 100)
        .join(",");
      const logoResponse = await axios.get(
        proxyUrl +
          `https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/info?id=${ids}`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": apiKey,
          },
        }
      );

      const logos = logoResponse.data.data;

      const enrichedData = rawData.map((item) => ({
        ...item,
        logo: logos[item.id]?.logo || "",
        quote: {
          USD: {
            price: item.quote.USD.price,
            percent_change_24h: item.quote.USD.percent_change_24h,
            percent_change_7d: item.quote.USD.percent_change_7d || 0,
            market_cap: item.quote.USD.market_cap,
          },
        },
      }));

      setCryptos(enrichedData);
    } catch (error) {
      console.error("Failed to fetch crypto data or logos:", error);
    }
  };

  useEffect(() => {
    getCryptoListing();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h2 className="text-lg md:text-3xl font-semibold mb-6 text-center">
        Live Cryptocurrency Prices by Market Capitalization
      </h2>

      <div className="w-full flex flex-col justify-center items-center overflow-x-auto mb-3">
        <div className="w-full overflow-x-auto mb-3">
          <table className="min-w-[600px] w-full max-w-4xl mx-auto table-auto border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="text-left py-2 px-4 border-b border-gray-600">
                  Coin
                </th>
                <th className="text-left py-2 px-4 border-b border-gray-600">
                  Scrip
                </th>
                <th className="text-right py-2 px-4 border-b border-gray-600">
                  Current Price (USD)
                </th>
                <th className="text-right py-2 px-4 border-b border-gray-600">
                  24h Change
                </th>
                <th className="text-right py-2 px-4 border-b border-gray-600">
                  Market Cap
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedCoin(item)}
                  className="cursor-pointer border-b border-gray-700 hover:bg-gray-800"
                >
                  <td className="py-2 px-4 flex items-center gap-2">
                    {item.logo && (
                      <img
                        // src={item.logo}
                        src={"/images/usdc.png"}
                        alt={item.name}
                        className="w-5 h-5"
                      />
                    )}
                    {item.name}
                  </td>
                  <td className="py-2 px-4">{item.symbol}</td>
                  <td className="py-2 px-4 text-right">
                    ${item.quote.USD.price.toFixed(2)}
                  </td>
                  <td
                    className={`py-2 px-4 text-right ${
                      item.quote.USD.percent_change_24h >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {item.quote.USD.percent_change_24h.toFixed(2)}%
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${item.quote.USD.market_cap.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => goToPage(page - 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-lg">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedCoin && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-2">
          <div className="bg-gray-800 p-3 md:p-6 rounded-lg w-full max-w-xl relative">
            <button
              onClick={() => setSelectedCoin(null)}
              className="absolute top-2 right-2 text-gray-300 hover:text-white text-xl"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              {selectedCoin.logo && (
                <img
                  // src={selectedCoin.logo}
                  src={"/images/usdc.png"}
                  alt={selectedCoin.name}
                  className="w-8 h-8"
                />
              )}
              <h3 className="text-2xl font-semibold">
                {selectedCoin.name} ({selectedCoin.symbol})
              </h3>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span>Current Price:</span>
                <span>${selectedCoin.quote.USD.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>24h Change:</span>
                <span
                  className={
                    selectedCoin.quote.USD.percent_change_24h >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {selectedCoin.quote.USD.percent_change_24h.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>7d Change:</span>
                <span
                  className={
                    selectedCoin.quote.USD.percent_change_7d >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {selectedCoin.quote.USD.percent_change_7d.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-4 mb-3">
              <button
                onClick={() => setFilter("24h")}
                className={`px-3 py-1 rounded ${
                  filter === "24h" ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setFilter("7d")}
                className={`px-3 py-1 rounded ${
                  filter === "7d" ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                7 Days
              </button>
            </div>

            <div className="bg-gray-900 p-2 rounded-md">
              <Line
                data={generateChartData(filter, selectedCoin.quote.USD.price)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CriptoTable;
