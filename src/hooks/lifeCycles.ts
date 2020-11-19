import { useEffect, useCallback } from 'react';

function useMount(callback: () => any) {
  const mountCb = useCallback(callback, []);
  useEffect(mountCb, []);
}

function useUnmount(callback: () => any) {
  const unmountCb = useCallback(() => callback, [callback]);
  useEffect(unmountCb, []);
}

export { useMount, useUnmount };
