"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { formatCurrency, formatDateTime } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  TrendingUp,
  Target,
  Award,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import { setUsers } from "../store/dashboard/UsersSlice";
import { setUserDetail } from "../store/dashboard/UserSlice";
import useGetUsers from "../hooks/useGetUsers";

export default function DashboardPage() {
  const userDetail = useSelector((state) => state.user);
  const users = useSelector((state) => state.users);

  const { data: session, status } = useSession();

  const { usersData, isLoading } = useGetUsers(users, session);

  const [repData, setRepData] = useState(userDetail ?? {});

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (usersData) {
      dispatch(setUsers(usersData));
    }
  }, [usersData]);

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
    enabled: !!session && !!match,
    staleTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (userInfo) {
      setRepData(userInfo[0]);
      dispatch(setUserDetail(userInfo[0]));
    }
  }, [userInfo]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || isLoading || isUserDetailLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // if (error) return <p style={{ color: "red" }}>⚠️ {error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {repData?.rep}!
            </h1>
            <p className="text-sm text-gray-600">
              Last updated:{" "}
              {repData?.last_computed_at
                ? formatDateTime(repData?.last_computed_at)
                : "8 Oct 2025"}
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Sales Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Target</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(repData?.target || 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(repData?.remaining || 0)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => router.push("/achieved-logs")}
              >
                <div className="text-left w-full">
                  <p className="text-sm text-gray-600">Achieved</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(repData?.achieved || 0)}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => router.push("/refund-logs")}
              >
                <div className="text-left w-full">
                  <p className="text-sm text-gray-600">Refunds</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(repData?.refunds || 0)}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Points & Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Points</p>
                <p className="text-2xl font-bold">{repData?.points || 0}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {repData?.level}
              </Badge>
            </div>
          </CardContent>
        </Card>
        {/* Incentives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Incentives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-semibold">
                  {formatCurrency(repData?.incentiveTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Released</span>
                <span className="font-semibold">
                  {formatCurrency(repData?.incentiveQuarterly)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quarterly Hold</span>
                <span className="font-semibold">
                  {formatCurrency(repData?.incentiveMonthly)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Recent Activity (this week) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity (this week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm">
                  Demos: <strong>{repData?.demos || 0}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  Closures: <strong>{repData?.closures || 0}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm">
                  Refunds: <strong>{repData?.refunds || 0}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm">
                  Response:{" "}
                  <strong>{repData?.avg_response_time_min || 0}m</strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Recent Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {repData?.rewards &&
                repData?.rewards.length > 0 &&
                repData?.rewards?.slice(0, 5).map((item, index) => {
                  const reward = item.split(" | ");
                  const text = reward[1];
                  const date = reward[0];
                  let points = 0;
                  if (text) {
                    points = text.split(" ")[0];
                  }

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{text}</p>
                        <p className="text-xs text-gray-500">{date}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {points}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-blue-800 font-medium text-center">
              Keep pushing, {repData?.rep || "Demo"}! You're doing great
            </p>
          </CardContent>
        </Card>
      </div>

      <Navigation activeTab="dashboard" />
    </div>
  );
}
