---
title: Overview
menuPosition: 1
---

The Fluid Framework provides developers with distributed data structures (DDSes) that automatically ensure that each
connected client has access to the same state. The APIs provided by DDSes are designed to be familiar to programmers
who've used common data structures before.

{{% callout note %}}

This article assumes that you are familiar with
[Introducing distributed data structures]({{< relref "dds.md" >}}).

{{% /callout %}}

A distributed data structure behaves like a local data structure. Your code can add data, remove data, update existing data,
etc.
However, a DDS is not a local object.
A DDS can also be changed by other clients that expose the same parent container of the DDS.
Because users can simultaneously change the same DDS, you need to consider which DDS to use for modeling your data.

{{% callout note "Meaning of 'simultaneously'" %}}

Two or more clients are said to make a change *simultaneously* if they each make a change before they have received the
others' changes from the server.

{{% /callout %}}

Choosing the correct data structure for your scenario can improve the performance and code structure of your application.

DDSes vary from each other by three characteristics:

-   **Basic data structure:** For example, key-value pair, a sequence, or a queue.
-   **Client autonomy vs. Consensus:** An *optimistic* DDS enables any client to unilaterally change a value and the new
  value is relayed to all other clients, while a *consensus-based* DDS will only allow a change if it is accepted by other clients via a
  consensus process.
-   **Merge policy:** The policy that determines how conflicting changes from clients are resolved.

Below we've enumerated the data structures and described when they may be most useful.

## SharedTree

[SharedTree](./tree.md) is a hierarchical data structure that looks and feels like simple JavaScript objects.
It is a tree of data with complex nodes, including maps that work similarly to [SharedMap](#sharedmap), and several kinds of leaf nodes, including boolean, string, number, null, and [Fluid handles]({{< relref "handles.md" >}}).

This is the recommended data structure for any new development.

## SharedMap

[SharedMap](./map.md) is a basic key-value data structure.
It is optimistic and uses a last-writer-wins merge policy.
Although the value of a pair can be a complex object, the value of any given pair can only be changed whole-for-whole.

### Common Problems

-   Storing a lot of data in one key-value entry may cause performance or merge issues.
  Each update will update the entire value rather than merging two updates.
  Try splitting the data across multiple keys.
-   Storing arrays, lists, or logs in a single key-value entry may lead to unexpected behavior because users can't collaboratively modify parts of one entry.
  Instread, try storing the data in an array node in a [SharedTree](#sharedtree).

## SharedString

The [SharedString](./string.md) DDS is used for unstructured text data that can be collaboratively edited. It is optimistic.

## Consensus data structures

Consensus data structures have one or both of these characteristics:

-   Only one client can perform a particular action on a particular data item, such as pull an item off of a queue.
-   An action, such as changing a value, can occur only when all clients consent to it.

These DDSes are **not** optimistic. Before a change to a consensus data structure is confirmed, the connected clients
must acknowledge the change.

-   TaskManager (experimental) -- Tracks queues of clients that want to exclusively run a task.

### Consensus scenarios

Typical scenarios require the connected clients to "agree" on some course of action.

-   Import data from an external source. (Multiple clients doing this could lead to duplicate data.)
-   Upgrade a data schema. (All clients agree to simultaneously make the change.)

## DDS Deprecation

[SharedTree](./tree.md) is an incredibly flexible DDS that allows developers to represent a variety of data models (primitives, objects, lists, maps in any nested orientation).
Due to this flexibility, it can also support features of various other DDSes in the Fluid repertoire.
As SharedTree becomes more feature-rich, we plan to start reducing support for other DDSes that offer a sub-set of the functionality.
This process takes the form of a deprecation journey for some of our existing DDSes, but rest assured, we will provide enough runway and support to migrate away from deprecated DDSes.

DDS deprecation will follow these steps:

-   **Provide alternative** - The recommended DDS will offer the same or better functionality than the deprecated DDS.
-   **Migration path to the recommended DDS** - Before we deprecate a DDS, we will provide the ability for developers to migrate their data from their existing data model to the new data model. This will allow you to convert existing Fluid data to your new data model.
-   **Deprecation of DDSes** - Deprecated DDSes will be marked deprecated in our APIs.
-   **Deprecated DDS becomes read-only** - Deprecated DDSes will always be readable but we will remove the write APIs for them.

<!-- AUTO-GENERATED-CONTENT:START (INCLUDE:path=../../../_includes/links.md) -->

<!-- prettier-ignore-start -->
<!-- NOTE: This section is automatically generated by embedding the referenced file contents. Do not update these generated contents directly. -->

<!-- Links -->

<!-- Concepts -->

[Fluid container]: {{< relref "containers.md" >}}
[Signals]: {{< relref "/docs/concepts/signals.md" >}}

<!-- Distributed Data Structures -->

[SharedCounter]: {{< relref "/docs/data-structures/counter.md" >}}
[SharedMap]: {{< relref "/docs/data-structures/map.md" >}}
[SharedString]: {{< relref "/docs/data-structures/string.md" >}}
[Sequences]: {{< relref "/docs/data-structures/sequences.md" >}}
[SharedTree]: {{< relref "/docs/data-structures/tree.md" >}}

<!-- API links -->

[fluid-framework]: {{< packageref "fluid-framework" "v2" >}}
[@fluidframework/azure-client]: {{< packageref "azure-client" "v2" >}}
[@fluidframework/tinylicious-client]: {{< packageref "tinylicious-client" "v1" >}}
[@fluidframework/odsp-client]: {{< packageref "odsp-client" "v2" >}}

[AzureClient]: {{< apiref "azure-client" "AzureClient" "class" "v2" >}}
[TinyliciousClient]: {{< apiref "tinylicious-client" "TinyliciousClient" "class" "v1" >}}

[FluidContainer]: {{< apiref "fluid-static" "IFluidContainer" "interface" "v2" >}}
[IFluidContainer]: {{< apiref "fluid-static" "IFluidContainer" "interface" "v2" >}}

<!-- prettier-ignore-end -->

<!-- AUTO-GENERATED-CONTENT:END -->
