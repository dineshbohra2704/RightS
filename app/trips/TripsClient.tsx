import Container from "@/components/Container";
import Heading from "@/components/Heading";
import ListingCard from "@/components/listing/ListingCard";
import { SafeReservation, SafeUser } from "@/types";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type Props = {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
};

function TripsClient({ reservations, currentUser }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");
  const [payingId, setPayingId] = useState("");

  const onCancel = useCallback(
    (id: string) => {
      setDeletingId(id);
      // Simulate delete success
      setTimeout(() => {
        toast.info("Reservation cancelled");
        setDeletingId("");
      }, 1000);
    },
    []
  );

  return (
    <PayPalScriptProvider options={{ "client-id": "YOUR_PAYPAL_CLIENT_ID" }}>
      <Container>
        <Heading
          title="Trips"
          subtitle="Where you've been and where you're going"
        />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {reservations.map((reservation) => (
            <div key={reservation.id}>
              <ListingCard
                data={reservation.listing}
                reservation={reservation}
                actionId={reservation.id}
                onAction={onCancel}
                disabled={deletingId === reservation.id}
                actionLabel="Cancel reservation"
                currentUser={currentUser}
              />

              {/* PayPal Payment Button */}
              {!reservation.isPaid && (
                <div className="mt-4">
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => {
                      setPayingId(reservation.id);
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: reservation.totalPrice.toString(),
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order?.capture().then(() => {
                        toast.success("Payment successful!");
                        setPayingId("");
                      });
                    }}
                    onError={() => {
                      toast.error("Payment failed.");
                      setPayingId("");
                    }}
                    disabled={payingId === reservation.id}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </PayPalScriptProvider>
  );
}

export default TripsClient;
