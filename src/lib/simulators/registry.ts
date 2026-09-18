import type { ComponentType } from "react";
import SortingSimulator from "@/components/simulators/SortingSimulator";
import ArraysCustomSimulator from "@/components/simulators/ArraysCustomSimulator";
import LinkedListInsertSimulator from "@/components/simulators/LinkedListInsertSimulator";
import StackVsQueueSimulator from "@/components/simulators/StackVsQueueSimulator";
import BstSimulator from "@/components/simulators/BstSimulator";
import GraphTraversalSimulator from "@/components/simulators/GraphTraversalSimulator";
import RecursionDpSimulator from "@/components/simulators/RecursionDpSimulator";
import SqlJoinSimulator from "@/components/simulators/SqlJoinSimulator";
import SqlIndexSimulator from "@/components/simulators/SqlIndexSimulator";
import SqlIsolationSimulator from "@/components/simulators/SqlIsolationSimulator";
import GitCommitGraphSimulator from "@/components/simulators/GitCommitGraphSimulator";
import GitMergeRebaseSimulator from "@/components/simulators/GitMergeRebaseSimulator";
import GitConflictSimulator from "@/components/simulators/GitConflictSimulator";
import PythonMutabilitySimulator from "@/components/simulators/PythonMutabilitySimulator";
import PythonGeneratorSimulator from "@/components/simulators/PythonGeneratorSimulator";
import PythonDecoratorSimulator from "@/components/simulators/PythonDecoratorSimulator";
import ApiAuthFlowSimulator from "@/components/simulators/ApiAuthFlowSimulator";
import ApiRateLimitAndPaginationSimulator from "@/components/simulators/ApiRateLimitAndPaginationSimulator";
import ApiIdempotencySimulator from "@/components/simulators/ApiIdempotencySimulator";
import ConsistentHashingSimulator from "@/components/simulators/ConsistentHashingSimulator";
import CachingSimulator from "@/components/simulators/CachingSimulator";
import CapTheoremSimulator from "@/components/simulators/CapTheoremSimulator";
import ContainersVsVmsSimulator from "@/components/simulators/ContainersVsVmsSimulator";
import CicdPipelineSimulator from "@/components/simulators/CicdPipelineSimulator";
import K8sSchedulingSimulator from "@/components/simulators/K8sSchedulingSimulator";
import ReactRerenderTreeSimulator from "@/components/simulators/ReactRerenderTreeSimulator";
import ReactListKeysSimulator from "@/components/simulators/ReactListKeysSimulator";
import ReactStoreReducerSimulator from "@/components/simulators/ReactStoreReducerSimulator";
import GradientDescentSimulator from "@/components/simulators/GradientDescentSimulator";
import NnForwardPassSimulator from "@/components/simulators/NnForwardPassSimulator";
import OverfittingSimulator from "@/components/simulators/OverfittingSimulator";
import MlDataPipelineSimulator from "@/components/simulators/MlDataPipelineSimulator";
import MlDriftDetectionSimulator from "@/components/simulators/MlDriftDetectionSimulator";
import MlCanaryRolloutSimulator from "@/components/simulators/MlCanaryRolloutSimulator";

export const SIMULATOR_REGISTRY: Record<string, ComponentType> = {
  "array-ops-custom": ArraysCustomSimulator,
  "sorting-comparison": SortingSimulator,
  "array-vs-list-insert": LinkedListInsertSimulator,
  "stack-vs-queue": StackVsQueueSimulator,
  "bst-traversal": BstSimulator,
  "graph-bfs-dfs": GraphTraversalSimulator,
  "recursion-and-dp": RecursionDpSimulator,
  "sql-join-comparison": SqlJoinSimulator,
  "sql-query-plan-deepdive": SqlIndexSimulator,
  "sql-isolation-comparison": SqlIsolationSimulator,
  "git-commit-graph": GitCommitGraphSimulator,
  "git-merge-vs-rebase": GitMergeRebaseSimulator,
  "git-conflict-detection": GitConflictSimulator,
  "python-mutability": PythonMutabilitySimulator,
  "python-generator-vs-list": PythonGeneratorSimulator,
  "python-decorator-stack": PythonDecoratorSimulator,
  "api-auth-flow": ApiAuthFlowSimulator,
  "api-rate-limit-pagination": ApiRateLimitAndPaginationSimulator,
  "api-idempotency": ApiIdempotencySimulator,
  "sd-consistent-hashing": ConsistentHashingSimulator,
  "sd-caching-comparison": CachingSimulator,
  "sd-cap-theorem": CapTheoremSimulator,
  "containers-vs-vms": ContainersVsVmsSimulator,
  "cicd-pipeline": CicdPipelineSimulator,
  "k8s-scheduling": K8sSchedulingSimulator,
  "react-rerender-tree": ReactRerenderTreeSimulator,
  "react-list-keys": ReactListKeysSimulator,
  "react-store-reducer": ReactStoreReducerSimulator,
  "gradient-descent": GradientDescentSimulator,
  "nn-forward-pass": NnForwardPassSimulator,
  "overfitting-comparison": OverfittingSimulator,
  "ml-data-pipeline": MlDataPipelineSimulator,
  "ml-drift-detection": MlDriftDetectionSimulator,
  "ml-canary-rollout": MlCanaryRolloutSimulator,
};
