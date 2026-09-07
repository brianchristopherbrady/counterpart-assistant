import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect, waitFor } from "@storybook/test";
import { Dialog } from "@/design-system/react/Dialog";
import { Button } from "@/design-system/react/Button";

const meta: Meta<typeof Dialog> = {
  title: "Design System/Dialog",
  component: Dialog,
};
export default meta;

type Story = StoryObj<typeof Dialog>;

function DialogHarness({ modal, defaultOpen = true }: { modal?: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} modal={modal} onDismiss={() => setOpen(false)} aria-label="Cancel appointment">
        <h2 style={{ marginTop: 0 }}>Cancel this appointment?</h2>
        <p>This will release the time slot so another patient can book it.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Button intent="secondary" onClick={() => setOpen(false)}>
            Keep appointment
          </Button>
          <Button intent="destructive" onClick={() => setOpen(false)}>
            Cancel appointment
          </Button>
        </div>
      </Dialog>
    </>
  );
}

export const Default: Story = { render: () => <DialogHarness /> };

export const NonModal: Story = { render: () => <DialogHarness modal={false} /> };

/** Opening moves focus into the dialog and traps it there; Escape dismisses and returns focus to the trigger. */
export const FocusBehavior: Story = {
  render: () => <DialogHarness defaultOpen={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // ds-dialog's role="dialog" lives inside its Shadow DOM, invisible to DOM-only role
    // queries — query the host tag and its shadow root directly instead.
    await userEvent.click(canvas.getByText(/open dialog/i));
    await waitFor(() => expect(canvasElement.querySelector("ds-dialog")).toBeInTheDocument());
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvasElement.querySelector("ds-dialog")).not.toBeInTheDocument());
  },
};

