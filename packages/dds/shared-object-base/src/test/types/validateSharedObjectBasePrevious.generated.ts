/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/*
 * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
 * Generated by flub generate:typetests in @fluid-tools/build-cli.
 */

import type { TypeOnly, MinimalType, FullType, requireAssignableTo } from "@fluidframework/build-tools";
import type * as old from "@fluidframework/shared-object-base-previous/internal";

import type * as current from "../../index.js";

declare type MakeUnusedImportErrorsGoAway<T> = TypeOnly<T> | MinimalType<T> | FullType<T> | typeof old | typeof current | requireAssignableTo<true, true>;

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_FluidSerializer": {"forwardCompat": false}
 */
declare type old_as_current_for_Class_FluidSerializer = requireAssignableTo<TypeOnly<old.FluidSerializer>, TypeOnly<current.FluidSerializer>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_FluidSerializer": {"backCompat": false}
 */
declare type current_as_old_for_Class_FluidSerializer = requireAssignableTo<TypeOnly<current.FluidSerializer>, TypeOnly<old.FluidSerializer>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_SharedObject": {"forwardCompat": false}
 */
declare type old_as_current_for_Class_SharedObject = requireAssignableTo<TypeOnly<old.SharedObject>, TypeOnly<current.SharedObject>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_SharedObject": {"backCompat": false}
 */
declare type current_as_old_for_Class_SharedObject = requireAssignableTo<TypeOnly<current.SharedObject>, TypeOnly<old.SharedObject>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_SharedObjectCore": {"forwardCompat": false}
 */
declare type old_as_current_for_Class_SharedObjectCore = requireAssignableTo<TypeOnly<old.SharedObjectCore>, TypeOnly<current.SharedObjectCore>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_SharedObjectCore": {"backCompat": false}
 */
declare type current_as_old_for_Class_SharedObjectCore = requireAssignableTo<TypeOnly<current.SharedObjectCore>, TypeOnly<old.SharedObjectCore>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_SummarySerializer": {"forwardCompat": false}
 */
declare type old_as_current_for_Class_SummarySerializer = requireAssignableTo<TypeOnly<old.SummarySerializer>, TypeOnly<current.SummarySerializer>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_SummarySerializer": {"backCompat": false}
 */
declare type current_as_old_for_Class_SummarySerializer = requireAssignableTo<TypeOnly<current.SummarySerializer>, TypeOnly<old.SummarySerializer>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassStatics_FluidSerializer": {"backCompat": false}
 */
declare type current_as_old_for_ClassStatics_FluidSerializer = requireAssignableTo<TypeOnly<typeof current.FluidSerializer>, TypeOnly<typeof old.FluidSerializer>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassStatics_SharedObject": {"backCompat": false}
 */
declare type current_as_old_for_ClassStatics_SharedObject = requireAssignableTo<TypeOnly<typeof current.SharedObject>, TypeOnly<typeof old.SharedObject>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassStatics_SharedObjectCore": {"backCompat": false}
 */
declare type current_as_old_for_ClassStatics_SharedObjectCore = requireAssignableTo<TypeOnly<typeof current.SharedObjectCore>, TypeOnly<typeof old.SharedObjectCore>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassStatics_SummarySerializer": {"backCompat": false}
 */
declare type current_as_old_for_ClassStatics_SummarySerializer = requireAssignableTo<TypeOnly<typeof current.SummarySerializer>, TypeOnly<typeof old.SummarySerializer>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Enum_ValueType": {"forwardCompat": false}
 */
declare type old_as_current_for_Enum_ValueType = requireAssignableTo<TypeOnly<old.ValueType>, TypeOnly<current.ValueType>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Enum_ValueType": {"backCompat": false}
 */
declare type current_as_old_for_Enum_ValueType = requireAssignableTo<TypeOnly<current.ValueType>, TypeOnly<old.ValueType>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Function_bindHandles": {"backCompat": false}
 */
declare type current_as_old_for_Function_bindHandles = requireAssignableTo<TypeOnly<typeof current.bindHandles>, TypeOnly<typeof old.bindHandles>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Function_createSharedObjectKind": {"backCompat": false}
 */
declare type current_as_old_for_Function_createSharedObjectKind = requireAssignableTo<TypeOnly<typeof current.createSharedObjectKind>, TypeOnly<typeof old.createSharedObjectKind>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Function_createSingleBlobSummary": {"backCompat": false}
 */
declare type current_as_old_for_Function_createSingleBlobSummary = requireAssignableTo<TypeOnly<typeof current.createSingleBlobSummary>, TypeOnly<typeof old.createSingleBlobSummary>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Function_makeHandlesSerializable": {"backCompat": false}
 */
declare type current_as_old_for_Function_makeHandlesSerializable = requireAssignableTo<TypeOnly<typeof current.makeHandlesSerializable>, TypeOnly<typeof old.makeHandlesSerializable>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Function_parseHandles": {"backCompat": false}
 */
declare type current_as_old_for_Function_parseHandles = requireAssignableTo<TypeOnly<typeof current.parseHandles>, TypeOnly<typeof old.parseHandles>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Function_serializeHandles": {"backCompat": false}
 */
declare type current_as_old_for_Function_serializeHandles = requireAssignableTo<TypeOnly<typeof current.serializeHandles>, TypeOnly<typeof old.serializeHandles>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IFluidSerializer": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IFluidSerializer = requireAssignableTo<TypeOnly<old.IFluidSerializer>, TypeOnly<current.IFluidSerializer>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IFluidSerializer": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IFluidSerializer = requireAssignableTo<TypeOnly<current.IFluidSerializer>, TypeOnly<old.IFluidSerializer>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISharedObject": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_ISharedObject = requireAssignableTo<TypeOnly<old.ISharedObject>, TypeOnly<current.ISharedObject>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISharedObject": {"backCompat": false}
 */
declare type current_as_old_for_Interface_ISharedObject = requireAssignableTo<TypeOnly<current.ISharedObject>, TypeOnly<old.ISharedObject>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISharedObjectEvents": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_ISharedObjectEvents = requireAssignableTo<TypeOnly<old.ISharedObjectEvents>, TypeOnly<current.ISharedObjectEvents>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISharedObjectEvents": {"backCompat": false}
 */
declare type current_as_old_for_Interface_ISharedObjectEvents = requireAssignableTo<TypeOnly<current.ISharedObjectEvents>, TypeOnly<old.ISharedObjectEvents>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISharedObjectKind": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_ISharedObjectKind = requireAssignableTo<TypeOnly<old.ISharedObjectKind<any>>, TypeOnly<current.ISharedObjectKind<any>>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISharedObjectKind": {"backCompat": false}
 */
declare type current_as_old_for_Interface_ISharedObjectKind = requireAssignableTo<TypeOnly<current.ISharedObjectKind<any>>, TypeOnly<old.ISharedObjectKind<any>>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_SharedObjectKind": {"backCompat": false}
 */
declare type current_as_old_for_Interface_SharedObjectKind = requireAssignableTo<TypeOnly<current.SharedObjectKind>, TypeOnly<old.SharedObjectKind>>
