import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

const WIDTHS = {
  md: 'w-full max-w-md',
  lg: 'w-full max-w-[520px]',
  xl: 'w-full max-w-[600px]',
};

/**
 * Right-side drawer for dashboard details.
 * UI-only: controlled via `isOpen` + `onClose`.
 */
const Drawer = ({ isOpen, onClose, title, children, footer, size = 'lg' }) => {
  return (
    <Transition show={!!isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-200"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-150"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel
                  className={`pointer-events-auto ${WIDTHS[size] || WIDTHS.lg} h-full bg-white shadow-2xl`}
                >
                  <div className="h-full flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <Dialog.Title className="text-lg font-bold text-gray-900">
                        {title}
                      </Dialog.Title>
                      <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                        aria-label="Close drawer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">{children}</div>

                    {footer ? (
                      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                        {footer}
                      </div>
                    ) : null}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Drawer;
