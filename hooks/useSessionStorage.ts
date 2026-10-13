'use client'

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react'
import type {Dispatch, SetStateAction} from 'react'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function readStoredValue<T>(key: string, fallback: T): T {
	try {
		const item = window.sessionStorage.getItem(key)
		return item !== null ? (JSON.parse(item) as T) : fallback
	} catch (error) {
		console.warn(`Unable to read sessionStorage key "${key}":`, error)
		return fallback
	}
}

function writeStoredValue<T>(key: string, value: T) {
	try {
		window.sessionStorage.setItem(key, JSON.stringify(value))
	} catch (error) {
		console.warn(`Unable to write sessionStorage key "${key}":`, error)
	}
}

export function useSessionStorage<T>(
	key: string,
	initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void, boolean] {
	const initialValueRef = useRef(initialValue)
	const storedValueRef = useRef(initialValue)
	const [storedValue, setStoredValue] = useState<T>(initialValue)
	const [isHydrated, setIsHydrated] = useState(false)

	// Read after mount so the server render and the first client render match.
	useIsomorphicLayoutEffect(() => {
		const nextValue = readStoredValue(key, initialValueRef.current)
		storedValueRef.current = nextValue
		setStoredValue(nextValue)
		setIsHydrated(true)
	}, [key])

	const setValue: Dispatch<SetStateAction<T>> = useCallback(
		(value) => {
			const newValue =
				typeof value === 'function' ? (value as (prev: T) => T)(storedValueRef.current) : value

			storedValueRef.current = newValue
			setStoredValue(newValue)
			writeStoredValue(key, newValue)
		},
		[key]
	)

	// Remove persisted data and reset state.
	const removeValue = useCallback(() => {
		try {
			window.sessionStorage.removeItem(key)
		} catch (error) {
			console.warn(`Unable to remove sessionStorage key "${key}":`, error)
		}

		storedValueRef.current = initialValueRef.current
		setStoredValue(initialValueRef.current)
		setIsHydrated(true)
	}, [key])

	return [isHydrated ? storedValue : initialValueRef.current, setValue, removeValue, isHydrated]
}
