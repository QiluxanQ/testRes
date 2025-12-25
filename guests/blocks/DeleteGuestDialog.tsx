
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { AlertTriangle } from 'lucide-react';
import { Guest } from '../../../../types/guest';

interface DeleteGuestDialogProps {
    guest: Guest | null;
    isOpen: boolean;
    onClose: () => void;
    onGuestDeleted: (guestId: number) => void;
    loading?: boolean;
}

export const DeleteGuestDialog: React.FC<DeleteGuestDialogProps> = ({
                                                                        guest,
                                                                        isOpen,
                                                                        onClose,
                                                                        onGuestDeleted,
                                                                        loading = false
                                                                    }) => {
    const handleDelete = () => {
        if (guest) {
            onGuestDeleted(guest.id);
        }
    };

    if (!guest) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        <DialogTitle>Удаление гостя</DialogTitle>
                    </div>
                    <DialogDescription>
                        Вы уверены, что хотите удалить гостя? Это действие нельзя отменить.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 font-medium">{guest.full_name}</p>
                        <p className="text-sm text-red-600">{guest.phone}</p>
                        <p className="text-sm text-red-600">{guest.email}</p>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? 'Удаление...' : 'Удалить'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};