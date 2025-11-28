      <DispenseForm
        workspaceProps={{
          medicationDispense,
          medicationRequestBundle,
          mode: 'edit',
          patientUuid: 'patient-uuid',
          encounterUuid: 'encounter-uuid',
          quantityRemaining: 30,
          quantityDispensed: 30,
        }}
        closeWorkspace={mockCloseWorkspace}
      />,
    );

    // In edit mode, the checkbox should not be rendered at all
    const checkbox = screen.queryByRole('checkbox', { name: /complete order with this dispense/i });
    expect(checkbox).not.toBeInTheDocument();
  });
});
