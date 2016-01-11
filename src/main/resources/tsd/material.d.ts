interface IComponentHandler {
    upgradeDom: Function;
    upgradeElements: (element: Element[]) => {}
}

declare var componentHandler: IComponentHandler;