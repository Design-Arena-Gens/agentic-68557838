'use client'

import { useCallback, useEffect, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import dagre from 'dagre'

interface MetadataMindMapProps {
  metadata: any
}

const MetadataMindMap = ({ metadata }: MetadataMindMapProps) => {
  const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 80 })

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 200, height: 80 })
    })

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 100,
          y: nodeWithPosition.y - 40,
        },
      }
    })

    return { nodes: layoutedNodes, edges }
  }

  const initialNodes: Node[] = useMemo(() => {
    if (!metadata) return []

    const nodes: Node[] = []
    const edges: Edge[] = []

    nodes.push({
      id: 'root',
      type: 'default',
      data: { label: `Salesforce Org\n${metadata.organizationName || 'Organization'}` },
      position: { x: 0, y: 0 },
      className: 'react-flow__node-root',
    })

    const categories = [
      { id: 'objects', label: 'Custom Objects', data: metadata.customObjects },
      { id: 'flows', label: 'Flows', data: metadata.flows },
      { id: 'classes', label: 'Apex Classes', data: metadata.apexClasses },
      { id: 'triggers', label: 'Apex Triggers', data: metadata.apexTriggers },
      { id: 'pages', label: 'Visualforce Pages', data: metadata.visualforcePages },
      { id: 'components', label: 'Lightning Components', data: metadata.lightningComponents },
      { id: 'profiles', label: 'Profiles', data: metadata.profiles },
      { id: 'permsets', label: 'Permission Sets', data: metadata.permissionSets },
    ]

    categories.forEach((category) => {
      if (category.data && category.data.length > 0) {
        nodes.push({
          id: category.id,
          type: 'default',
          data: { label: `${category.label}\n(${category.data.length})` },
          position: { x: 0, y: 0 },
          className: 'react-flow__node-category',
        })

        edges.push({
          id: `root-${category.id}`,
          source: 'root',
          target: category.id,
          markerEnd: { type: MarkerType.ArrowClosed },
        })

        category.data.slice(0, 10).forEach((item: any, index: number) => {
          const itemId = `${category.id}-${index}`
          nodes.push({
            id: itemId,
            type: 'default',
            data: { label: item.fullName || item.name || `Item ${index + 1}` },
            position: { x: 0, y: 0 },
            className: 'react-flow__node-metadata',
          })

          edges.push({
            id: `${category.id}-${itemId}`,
            source: category.id,
            target: itemId,
            markerEnd: { type: MarkerType.ArrowClosed },
          })
        })

        if (category.data.length > 10) {
          const moreId = `${category.id}-more`
          nodes.push({
            id: moreId,
            type: 'default',
            data: { label: `... ${category.data.length - 10} more` },
            position: { x: 0, y: 0 },
            className: 'react-flow__node-metadata',
          })

          edges.push({
            id: `${category.id}-${moreId}`,
            source: category.id,
            target: moreId,
            markerEnd: { type: MarkerType.ArrowClosed },
          })
        }
      }
    })

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges)
    return layoutedNodes
  }, [metadata])

  const initialEdges: Edge[] = useMemo(() => {
    if (!metadata) return []

    const edges: Edge[] = []

    edges.push({ id: 'root-objects', source: 'root', target: 'objects', markerEnd: { type: MarkerType.ArrowClosed } })
    edges.push({ id: 'root-flows', source: 'root', target: 'flows', markerEnd: { type: MarkerType.ArrowClosed } })
    edges.push({ id: 'root-classes', source: 'root', target: 'classes', markerEnd: { type: MarkerType.ArrowClosed } })
    edges.push({ id: 'root-triggers', source: 'root', target: 'triggers', markerEnd: { type: MarkerType.ArrowClosed } })
    edges.push({ id: 'root-pages', source: 'root', target: 'pages', markerEnd: { type: MarkerType.ArrowClosed } })
    edges.push({ id: 'root-components', source: 'root', target: 'components', markerEnd: { type: MarkerType.ArrowClosed } })
    edges.push({ id: 'root-profiles', source: 'root', target: 'profiles', markerEnd: { type: MarkerType.ArrowClosed } })
    edges.push({ id: 'root-permsets', source: 'root', target: 'permsets', markerEnd: { type: MarkerType.ArrowClosed } })

    const categories = [
      { id: 'objects', data: metadata.customObjects },
      { id: 'flows', data: metadata.flows },
      { id: 'classes', data: metadata.apexClasses },
      { id: 'triggers', data: metadata.apexTriggers },
      { id: 'pages', data: metadata.visualforcePages },
      { id: 'components', data: metadata.lightningComponents },
      { id: 'profiles', data: metadata.profiles },
      { id: 'permsets', data: metadata.permissionSets },
    ]

    categories.forEach((category) => {
      if (category.data && category.data.length > 0) {
        category.data.slice(0, 10).forEach((item: any, index: number) => {
          const itemId = `${category.id}-${index}`
          edges.push({
            id: `${category.id}-${itemId}`,
            source: category.id,
            target: itemId,
            markerEnd: { type: MarkerType.ArrowClosed },
          })
        })

        if (category.data.length > 10) {
          const moreId = `${category.id}-more`
          edges.push({
            id: `${category.id}-${moreId}`,
            source: category.id,
            target: moreId,
            markerEnd: { type: MarkerType.ArrowClosed },
          })
        }
      }
    })

    return edges
  }, [metadata])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default MetadataMindMap
