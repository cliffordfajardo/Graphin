import React from 'react';
import { Graph as IGraph } from '@antv/g6';
import { ApisType } from '../apis/types';
import { ThemeType } from '../theme/index';
import LayoutController from '../layout';
import { GraphinData, GraphinTreeData } from 'typings/type';

const defaultGraphinContext = {
  graph: undefined,
  apis: undefined,
  theme: undefined,
  layout: undefined,
  isGraphinReady: false,
  data: undefined,
};

type GraphinContextType = {
  /**
   * @description
   * G6 Instance
   */
  graph: IGraph | undefined;
  /**
   * @description
   *
   */
  apis: ApisType | undefined;
  /**
   * @description
   *
   */
  theme: ThemeType | undefined;
  /**
   * @decription
   */
  layout: LayoutController | undefined;
  /**
   * @description
   * Returns whether the underlying render (canvas) is ready.
   */
  isGraphinReady: boolean;
  /**
   * @description
   * The nodes, edges, and combos that you will get passed down to the G6 instance
   */
  data: undefined | GraphinTreeData | GraphinData;

  setGraphinContext?: React.Dispatch<
    React.SetStateAction<{
      graph: IGraph;
      apis: ApisType | undefined;
      theme: ThemeType | undefined;
      layout: LayoutController | undefined;
      isGraphinReady: boolean;
    }>
  >;
};

const defaultGraphinContextValue = defaultGraphinContext as GraphinContextType;
const GraphinContext = React.createContext<GraphinContextType>(defaultGraphinContextValue);
GraphinContext.displayName = 'GraphinContext';

type GraphinContextValues = {
  graph: IGraph | undefined;
  apis: ApisType | undefined;
  theme: ThemeType | undefined;
  layout: LayoutController | undefined;
  isGraphinReady: boolean;
  data: undefined | GraphinTreeData | GraphinData;

  setGraphinContext: React.Dispatch<
    React.SetStateAction<{
      graph: IGraph;
      apis: ApisType | undefined;
      theme: ThemeType | undefined;
      layout: LayoutController | undefined;
      isGraphinReady: boolean;
    }>
  >;
};

/**
 * @description
 * This provider is responsible for managing the GraphinProvider state.
 * More info: https://kentcdodds.com/blog/authentication-in-react-applications
 *
 * @example
 * <GraphinProvider>
 *    <Graphin {...}></Graphin>
 * </GraphinProvider>
 */
const GraphinProvider = ({ children }: { children: React.ReactNode }) => {
  const [graphinContext, setGraphinContext] = React.useState<GraphinContextType>({
    graph: undefined,
    apis: undefined,
    theme: undefined,
    layout: undefined,
    isGraphinReady: false,
    data: undefined,
  });

  const contextValues = {
    ...graphinContext,
    setGraphinContext,
  } as GraphinContextValues;

  React.useEffect(() => {}, [graphinContext.isGraphinReady]);

  return <GraphinContext.Provider value={contextValues}>{children}</GraphinContext.Provider>;
};

/**
 * @description
 * A hook responsible for interacting with and retrieving data from the  MyGraphinContext
 * @example
 * const {graph, api, ...otherStuff} = useGraphin();
 */
const useGraphin = () => {
  const context = React.useContext(GraphinContext);

  if (context === undefined || Object.keys(context).length === 0) {
    throw new Error(`useGraphin hook must be used within a GraphinProvider`);
  }

  return context;
};

export { GraphinProvider, useGraphin };
