"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import useGetUsers from "../hooks/useGetUsers";
import { setUsers } from "../store/dashboard/UsersSlice";

export default function AchievedLogsPage() {
  const users = useSelector((state) => state.users);

  const { data: session, status } = useSession();

  const [archiveLogs, setArchiveLogs] = useState({});

  const dispatch = useDispatch();
  const router = useRouter();

  const { usersData, isLoading } = useGetUsers(users, session);

  const match = users.find(
    (r) => r?.email?.toLowerCase().trim() === session?.user?.email
  );

  const { data: userInfo, isLoading: isUserDetailLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch(
        `/api/user?rep=${encodeURIComponent(match.rep)}`
      );
      if (!response.ok) throw new Error("Failed to fetch user details");
      return response.json();
    },
    enabled: !!session,
    staleTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (usersData) {
      dispatch(setUsers(usersData));
    }
  }, [usersData]);

  useEffect(() => {
    if (userInfo) {
      setArchiveLogs(userInfo[0] || {});
    }
  }, [userInfo]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  if (status === "loading" || isLoading || isUserDetailLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Achieved Logs</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(
                    // archiveLogs.reduce((sum, log) => sum + log.total, 0)
                    archiveLogs?.totalArchive || 0
                  )}
                </p>
                <p className="text-sm text-green-600">Total Achieved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {/* {archiveLogs.reduce((sum, log) => sum + log.deals, 0)} */}
                  {formatCurrency(
                    // archiveLogs.reduce((sum, log) => sum + log.total, 0)
                    archiveLogs?.totalDeals || 0
                  )}
                </p>
                <p className="text-sm text-green-600">Total Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Month-wise Logs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Monthly Breakdown
          </h2>

          {archiveLogs?.breakdown
            ? archiveLogs.breakdown.map((log, index) => (
                <div key={index} className="space-y-2">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900">
                            {log.month}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              Amount:{" "}
                              <strong className="text-green-600">
                                {formatCurrency(log.total || 0)}
                              </strong>
                            </span>
                            <Badge variant="outline">
                              {log.deals || 0} deals
                            </Badge>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const element = document.getElementById(
                              `transactions-${index}`
                            );
                            if (element) {
                              element.classList.toggle("hidden");
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div id={`transactions-${index}`} className="hidden">
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-gray-800 mb-3">
                          Transaction Details - {log.month || 0}
                        </h4>
                        <div className="space-y-2">
                          {log.transactions &&
                            log.transactions?.map((transaction, txIndex) => (
                              <div
                                key={txIndex}
                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {transaction.client || "Demo"}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {transaction.date || "2025-10-08"} • Lead #
                                    {transaction.lead_id || "Demo"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600">
                                    {formatCurrency(transaction.amount || 0)}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))
            : []}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-700">
              💡 <strong>Note:</strong> Click "View Details" to access detailed
              logs and transaction records for each month.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
