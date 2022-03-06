/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
/**
 * ❗ NOTE: this ia a new verison of Graphin Component that is a Functional component.
 * It it currently in its own file so we can isolate it from the current implementation which is a Class based component.
 */
import React, { useEffect } from 'react';
// import { useGraphin } from 'context';
import { getDefaultStyleByTheme, ThemeData, ThemeType } from '../../theme';
import G6, { Graph, GraphData, IGraph, TreeGraphData, type GraphOptions, type Modes } from '@antv/g6';
import {
  type GraphinTreeData,
  type GraphinData,
  type Layout,
  type NodeStyle,
  type EdgeStyle,
  ComboStyle,
  IUserNode,
  PlainObject,
} from 'typings/type';
import { DEFAULT_TREE_LATOUT_OPTIONS, TREE_LAYOUTS } from 'consts';
import LayoutControllerV2 from 'layout/LayoutControllerV2';
import { ApisType } from 'apis/types';
import ApiController from 'apis';
import useDeepCompareEffect from './hooks/useDeepCompareEffect';
import cloneDeep from 'lodash.clonedeep';
import GraphinContext from 'GraphinContext';

export interface GraphinProps {
  /**
   * @description
   * user custom styles that are applied on the x HTML element
   * @example
   * ADD DOC LINK
   */
  style?: React.CSSProperties;
  /**
   * @description
   * Theme that is applied to....
   * @example
   * ADD DOC LINK
   */
  theme?: Partial<ThemeType>;
  /**
   * @description
   * The nodes, edges, and combos that you will get passed down to the G6 instance
   * @example
   * ADD DOCS
   */
  data: GraphinTreeData | GraphinData;
  /**
   * @decription
   *
   * @example
   */
  layout?: Layout;
  /**
   * @decription
   *
   * @example
   */
  modes?: Modes;

  /**
   * @description
   * Callback function after layout
   * @example
   */
  handleAfterLayout?: (graph: IGraph) => void;
  /**
   * @description
   * Default style configuration for nodes
   *
   * @example
   */
  defaultNode?: Partial<{
    type?: string;
    style: NodeStyle;
    [key: string]: any;
  }>;
  /**
   * @description
   * Default style configuration for edges
   *
   * @example
   */
  defaultEdge?: Partial<{
    type?: 'graphin-line';
    style: EdgeStyle;
    [key: string]: any;
  }>;
  /**
   * @description
   * Default style configuration for combos
   *
   * @example
   */
  defaultCombo?: Partial<{
    type?: string;
    style: ComboStyle;
    [key: string]: any;
  }>;

  /** 默认的节点 状态样式 */
  nodeStateStyles?: {
    status: Partial<NodeStyle['status']>;
  };
  /** 默认的边 状态样式 */
  edgeStateStyles?: {
    status: Partial<EdgeStyle['status']>;
  };
  /** 默认的Combo样式 */
  comboStateStyles?: {
    status: Partial<ComboStyle['status']>;
  };

  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /**
   * 是否启用全局动画
   */
  animate?: boolean;
  /* 动画设置,仅在 animate 为 true 时有效 */
  animateCfg?: {
    /**
     * 帧回调函数，用于自定义节点运动路径，为空时线性运动
     */
    onFrame: undefined;
    /**
     * 动画时长(ms)
     */
    duration: number;
    /**
     * 指定动画动效
     */
    easing: string;
  };
  /**
   * 边直接连接到节点的中心，不再考虑锚点
   */
  linkCenter?: boolean;

  /**
   * 多边配置
   */
  parallel?: Partial<{
    // 多边之间的偏移量
    offsetDiff: number;
    // 多条边时边的类型
    multiEdgeType: string;
    // 单条边的类型
    singleEdgeType: string;
    // 自环边的类型
    loopEdgeType: string;
  }>;
  /** user custom props */
  [key: string]: any;

  /**
   * @description
   * Any valid JSX element to pass and render inside the
   * @example
   * <div class="graphin-components"> {children}</div>
   */
  // children: React.ReactChildren;
}

export interface GraphinState {
  isReady: boolean;
  context: {
    graph: Graph | undefined;
    apis: ApisType | undefined;
    theme: ThemeData | undefined;
    layout: LayoutControllerV2 | undefined;
    dragNodes: IUserNode[];
    updateContext: (config: PlainObject) => void;
  };
}

const [DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT] = [500, 500];

/**
 * @description
 * ..
 */
const Graphin = (props: GraphinProps) => {
  // const { isGraphinReady, graph:_graph, setGraphinContext, apis } = useGraphin();
  // ----------- START: Initialization setup (this is the constructor logic from old <Graphin> class component) -----------
  const {
    data: prop_data,
    layout: prop_layout,
    width: prop_width,
    height: prop_height,
    layoutCache: prop_layoutCache,
    ...prop_otherOptions
  } = props;

  const [data, setData] = React.useState<GraphinTreeData | GraphinData | undefined>(prop_data);
  const [isTree, setIsTree] = React.useState<boolean>(
    Boolean((prop_data as GraphinTreeData)?.children?.length) || TREE_LAYOUTS.includes(String(prop_layout?.type)),
  );
  const [graph, setGraph] = React.useState<Graph | undefined>(undefined);
  const [width, setWidth] = React.useState(prop_width || DEFAULT_CANVAS_WIDTH);
  const [height, setHeight] = React.useState(prop_height || DEFAULT_CANVAS_HEIGHT);

  const [theme, setTheme] = React.useState<ThemeData | undefined>(undefined);
  const [apis, setApis] = React.useState<ApisType | undefined>(undefined);
  const [layoutCache, setLayoutCache] = React.useState(prop_layoutCache);
  const [layout, setLayout] = React.useState<LayoutControllerV2 | undefined>(undefined);
  const [dragNodes, setDragNodes] = React.useState<IUserNode[]>([]);
  const [options, setOptions] = React.useState<GraphOptions>({ ...prop_otherOptions } as GraphOptions);
  const graphDOM = React.useRef<HTMLDivElement>(null);

  const updateContext = React.useCallback((config: PlainObject) => {
    setGraphinState({
      ...graphinState,
      ...config,
    });
  }, []);

  const [graphinState, setGraphinState] = React.useState<GraphinState>({
    isReady: false,
    context: {
      graph,
      apis,
      theme,
      layout,
      dragNodes,

      updateContext,
    },
  });

  // ----------- END: Initialization setup (this is the constructor logic from old <Graphin> class component) -----------

  // ----------- START: `componentDidMount` for old <Graphin> class) -----------
  /**
   * @description
   * This hook runs when component is mounted (componentDidMount).
   * It is initializing the data for our component. It is doing things like
   * setting default values if none are provided
   */
  React.useEffect(() => {
    const {
      theme: prop_theme,
      data: prop_data,
      layout: prop_layout,
      width: prop_width,
      height: prop_height,
      defaultCombo: prop_defaultCombo = { style: {}, type: 'graphin-combo' },
      defaultEdge: prop_defaultEdge = { style: {}, type: 'graphin-line' },
      defaultNode: prop_defaultNode = { style: {}, type: 'graphin-circle' },
      nodeStateStyles: prop_nodeStateStyles,
      edgeStateStyles: prop_edgeStateStyles,
      comboStateStyles: prop_comboStateStyles,
      modes: prop_modes = { default: [] },
      animate: prop_animate,
      handleAfterLayout: prop_handleAfterLayout,
      ...prop_otherOptions
    } = props;

    const { clientWidth, clientHeight } = graphDOM?.current || {
      clientWidth: DEFAULT_CANVAS_WIDTH,
      clientHeight: DEFAULT_CANVAS_HEIGHT,
    };
    setWidth(Number(width) || clientWidth || DEFAULT_CANVAS_WIDTH);
    setHeight(Number(height) || clientHeight || DEFAULT_CANVAS_WIDTH);

    const _modes = !Array.isArray(prop_modes) ? { default: [] } : prop_modes;
    if (_modes) {
      // TODO :给用户正确的引导，推荐使用Graphin的Behaviors组件
      console.info('%c suggestion: you can use @antv/graphin Behaviors components', 'color:lightgreen');
    }

    // Initialize data for rendering
    let isTree = Array.isArray((data as GraphinTreeData)?.children);
    setIsTree(isTree);

    // Initialize theme
    const themeResult = getDefaultStyleByTheme(theme);

    const {
      defaultNodeStyle,
      defaultEdgeStyle,
      defaultComboStyle,
      defaultNodeStatusStyle,
      defaultEdgeStatusStyle,
      defaultComboStatusStyle,
      ...otherTheme
    } = themeResult;

    isTree = Boolean((data as GraphinTreeData).children) || TREE_LAYOUTS.includes(String(layout && layout.type));

    const finalStyle = {
      defaultNode: {
        style: { ...prop_defaultNode.style, _theme: theme },
        type: prop_defaultNode.type || 'graphin-circle',
      }, // isGraphinNodeType ? deepMix({}, defaultNodeStyle, defaultNode) : defaultNode,
      defaultEdge: {
        style: { ...prop_defaultEdge.style, _theme: theme },
        type: prop_defaultEdge.type || 'graphin-line',
      }, // isGraphinEdgeType ? deepMix({}, defaultEdgeStyle, defaultEdge) : defaultEdge,
      defaultCombo: { style: { ...prop_defaultCombo.style, _theme: theme }, type: prop_defaultCombo.type || 'combo' }, // deepMix({}, defaultComboStyle, defaultCombo), // TODO:COMBO的样式需要内部自定义
      /** status 样式 */
      nodeStateStyles: prop_nodeStateStyles, // isGraphinNodeType ? deepMix({}, defaultNodeStatusStyle, nodeStateStyles) : nodeStateStyles,
      edgeStateStyles: prop_edgeStateStyles, // isGraphinEdgeType ? deepMix({}, defaultEdgeStatusStyle, edgeStateStyles) : edgeStateStyles,
      comboStateStyles: prop_comboStateStyles, // deepMix({}, defaultComboStatusStyle, comboStateStyles),
    };

    // @ts-ignore : TODO: need to combback and fix so we can remove `ts-ignore`
    setTheme({ ...finalStyle, ...otherTheme } as ThemeData);

    const _options = {
      container: graphDOM.current,
      renderer: 'canvas',
      width: prop_width,
      height: prop_height,
      animate: prop_animate !== false,
      ...finalStyle,
      modes: prop_modes,
      ...prop_otherOptions,
    } as GraphOptions;

    let g6GraphInstance: Graph;
    if (isTree) {
      _options.layout = prop_layout || DEFAULT_TREE_LATOUT_OPTIONS;
      g6GraphInstance = new G6.TreeGraph(_options);
      setGraph(g6GraphInstance);
    } else {
      g6GraphInstance = new G6.Graph(_options);
      setGraph(g6GraphInstance);
    }
    setOptions(_options as GraphOptions);

    // --------------Setup event handlers----------
    /**
     * 内置事件:AfterLayout 回调
     * Built-in event: AfterLayout callback
     */
    g6GraphInstance.on('afterlayout', () => {
      if (prop_handleAfterLayout) {
        prop_handleAfterLayout(g6GraphInstance);
      }
    });

    /**
     * 装载数据
     * Load the graph data
     * */
    g6GraphInstance.data(data as GraphData | TreeGraphData);

    /**
     * 渲染
     * Render the data to the DOM
     */
    g6GraphInstance.render();

    /** 初始化布局：仅限网图
     * Initial layout: Netmap only
     */
    if (!isTree) {
      const layout = new LayoutControllerV2({
        graph: g6GraphInstance,
        data,
        isTree,
        layoutCache,
        width,
        height,
        options,
      });
      setLayout(layout);
      layout.start();
    }

    // START --------------- initStatus logic ---------------------
    if (!isTree) {
      const { nodes = [], edges = [] } = data as GraphinData;
      nodes.forEach(node => {
        const { status } = node;
        if (status) {
          Object.keys(status).forEach(k => {
            g6GraphInstance.setItemState(node.id, k, Boolean(status[k]));
          });
        }
      });
      edges.forEach(edge => {
        const { status } = edge;
        if (status) {
          Object.keys(status).forEach(k => {
            g6GraphInstance.setItemState(edge.id, k, Boolean(status[k]));
          });
        }
      });
    }
    // END --------------- initStatus logic -----------------------

    setApis(ApiController(g6GraphInstance));
    setGraphinState(prevState => {
      return {
        ...prevState,
        isReady: true,
        context: {
          graph,
          apis,
          theme,
          layout,
          dragNodes,
          updateContext,
        },
      };
    });

    return function onComponentUnmount() {
      // This method simulates `clear` method inside `componentWillUnmount` from old <Graphin> class component
      // Reset handlers and data on unmount
      if (layout?.destroy) {
        layout.destroy();
      }
      setLayout({} as LayoutControllerV2);
      graph?.clear();
      setData({ nodes: [], edges: [], combos: [] });
      graph?.destroy();
    };
  }, []);
  // ----------- END: `componentDidMount` for old <Graphin> class) -----------

  // ----------- START: `componentDidUpate (data prop)` for old <Graphin> class) -----------
  React.useEffect(() => {
    if ((data as GraphinTreeData).children) {
      setIsTree(true);
    }
    const newData = cloneDeep(data);
    setData(newData);

    if (isTree) {
      graph?.changeData(newData as TreeGraphData);
    } else {
      const {
        context: { dragNodes },
      } = graphinState;
      // 更新拖拽后的节点的mass到data
      // @ts-ignore
      data?.nodes?.forEach(node => {
        const dragNode = dragNodes.find(item => item.id === node.id);
        if (dragNode) {
          node.layout = {
            ...node.layout,
            force: {
              mass: dragNode.layout?.force?.mass,
            },
          };
        }
      });

      graph?.data(data as GraphData | TreeGraphData);
      graph?.set('layoutController', null);
      graph?.changeData(data as GraphData | TreeGraphData);
      // 由于 changeData 是将 this.data 融合到 item models 上面，因此 changeData 后 models 与 this.data 不是同一个引用了
      // 执行下面一行以保证 graph item model 中的数据与 this.data 是同一份
      const dataFromGraph = layout?.getDataFromGraph();
      // @ts-ignore
      setData(dataFromGraph);
      layout?.changeLayout();
    }
  }, [data]);
  // ----------- END: `componentDidUpate (data prop)` for old <Graphin> class) -----------

  // ----------- START: `componentDidUpate (layout prop)` for old <Graphin> class) --------
  React.useEffect(() => {
    if (isTree) {
      graph?.updateLayout(props.layout);
    }
    /**
     * TODO
     * 1. preset 前置布局判断问题
     * 2. enablework 问题
     * 3. G6 LayoutController 里的逻辑
     */
    /** 数据需要从画布中来 */
    const dataFromGraph = layout?.getDataFromGraph();
    // @ts-ignore
    setData(dataFromGraph);
    layout?.changeLayout();
    layout?.refreshPosition();

    /** 走G6的layoutController */
    // this.graph.updateLayout();
    // console.log('%c isLayoutChange', 'color:grey');
    // graph?.emit('graphin:layoutchange', { prevLayout: prevProps.layout, layout });
    graph?.emit('graphin:layoutchange', { prevLayout: layout, layout });
  }, [layout]);
  // ----------- END: `componentDidUpate (layout prop)` for old <Graphin> class) -----------

  React.useEffect(() => {
    graph?.emit('graphin:datachange');
  }, [graphinState]);

  // ----------- END: logic for when the component mounts to the DOM (same logic from `componentDidMount` for old <Graphin> class) -----------

  return (
    <>
      <div data-testid="graphin-container" id="graphin-container">
        <div
          ref={graphDOM}
          data-testid="custom-element"
          className="graphin-core"
          style={{ background: theme?.background, ...props.style }}
        />
        <div className="graphin-components">
          {graphinState.isReady && (
            <>
              {
                /** modes:
                 * 不存在的时候，才启动默认的behaviors，否则会覆盖用户自己传入的
                 * When modes does not exist, the default behaviors will be activated, otherwise it will overwrite the ones passed in by the user.
                 */
                !props.modes && (
                  <>
                    <p>hello</p>
                  </>
                )
              }
              {/** resize 画布 */}
              {/* <ResizeCanvas graphDOM={this.graphDOM as HTMLDivElement} /> */}
              {/* <Hoverable bindType="edge" /> */}
              {props.children}
              {/* <Hoverable bindType="node" /> 2.3.3 版本移除 */}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Graphin;
