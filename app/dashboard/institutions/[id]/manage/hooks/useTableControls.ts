"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";

type SortDir = "asc" | "desc";

interface TableControlsOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  defaultSort?: keyof T;
  defaultPageSize?: number;
}

interface TableControlsReturn<T> {
  search: string;
  setSearch: (val: string) => void;
  sortKey: keyof T | null;
  sortDir: SortDir;
  toggleSort: (key: keyof T) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  paged: T[];
  totalPages: number;
  totalFiltered: number;
  debouncedSearch: string;
}

export function useTableControls<T>({
  data,
  searchFields,
  defaultSort,
  defaultPageSize = 10,
}: TableControlsOptions<T>): TableControlsReturn<T> {
  const [search, setSearchRaw] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultSort ?? null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(defaultPageSize);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearch = useCallback((val: string) => {
    setSearchRaw(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
    }, 500);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return data;
    const q = debouncedSearch.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const val = item[field];
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, debouncedSearch, searchFields]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const aStr = String(av).toLowerCase();
      const bStr = String(bv).toLowerCase();
      const aNum = Number(av);
      const bNum = Number(bv);
      const useNum = !Number.isNaN(aNum) && !Number.isNaN(bNum);
      const cmp = useNum ? aNum - bNum : aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalFiltered = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const toggleSort = useCallback(
    (key: keyof T) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeRaw(size);
  }, []);

  return {
    search,
    setSearch,
    sortKey,
    sortDir,
    toggleSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    paged,
    totalPages,
    totalFiltered,
    debouncedSearch,
  };
}
