"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useQuery } from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft, ExternalLink, Calendar, AlertTriangle } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import useGetUsers from "../hooks/useGetUsers";
import { setUsers } from "../store/dashboard/UsersSlice";

export default function RefundLogsPage() {
  const users = useSelector((state) => state.users);

  const { data: session, status } = useSession();

  const [refundLogs, setRefundLogs] = useState({});

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
      setRefundLogs(userInfo[0] || {});
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
            <h1 className="text-2xl font-bold text-gray-900">Refund Logs</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Card */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(refundLogs.totalRefunds || 0)}
                </p>
                <p className="text-sm text-red-600">Total Refunds</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">
                  {refundLogs.totalCases || 0}
                </p>
                <p className="text-sm text-red-600">Total Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Notice */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Impact on Incentives</p>
                <p>
                  Refunds are deducted from your quarterly held incentives.
                  Focus on quality deals to minimize refunds.
                </p>
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

          {refundLogs.breakdown &&
            refundLogs.breakdown.map((log, index) => (
              <div key={index} className="space-y-2">
                <Card
                  className={`hover:shadow-md transition-shadow ${
                    log.total === 0 ? "bg-green-50 border-green-200" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900">
                          {log.month || "October 2025"}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {log.total === 0 ? (
                            <span className="text-green-600 font-medium">
                              ✨ No refunds this month!
                            </span>
                          ) : (
                            <>
                              <span>
                                Amount:{" "}
                                <strong className="text-red-600">
                                  {formatCurrency(log.total || 0)}
                                </strong>
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                {log.count || 0}{" "}
                                {log.count === 1 ? "refund" : "refunds"}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>

                      {log.total > 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const element = document.getElementById(
                              `refund-transactions-${index}`
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
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-green-700 bg-green-50"
                        >
                          Clean Month
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Expandable Refund Transactions List */}
                {log.total > 0 && (
                  <div id={`refund-transactions-${index}`} className="hidden">
                    <Card className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-gray-800 mb-3">
                          Refund Details - {log.month || "October 2025"}
                        </h4>
                        <div className="space-y-2">
                          {log.transactions &&
                            log.transactions?.map((transaction, txIndex) => (
                              <div
                                key={txIndex}
                                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {transaction.client || "Demmo"}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {transaction.date || "2025-10-08"} • Lead #
                                    {transaction.lead_id || "Demo"}
                                  </p>
                                  <p className="text-xs text-orange-600 mt-1">
                                    Reason:{" "}
                                    {transaction.reason || "Product not found"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-red-600">
                                    -{formatCurrency(transaction.amount || 0)}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 text-lg">
              💡 Tips to Reduce Refunds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Qualify leads thoroughly during demo</li>
              <li>• Set clear expectations about product capabilities</li>
              <li>• Follow up proactively post-sale</li>
              <li>• Ensure proper onboarding and training</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
